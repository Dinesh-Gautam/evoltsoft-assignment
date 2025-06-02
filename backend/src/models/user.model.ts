import mongoose, { Document, Schema, Model, CallbackWithoutResultAndOptionalError } from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * Interface representing a User document.
 */
export interface IUser extends Document {
  username: string
  email: string
  password?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

/**
 * Interface for the User model, adding static methods if any (none for now).
 */
export interface IUserModel extends Model<IUser> {}

const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password
        return ret
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password
        return ret
      },
    },
  }
)

/**
 * Pre-save middleware to hash the password before saving.
 * This hook is triggered when a new user is created or when the password field is modified.
 */
userSchema.pre<IUser>(
  'save',
  async function (this: IUser, next: CallbackWithoutResultAndOptionalError) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password') || !this.password) {
      return next()
    }

    try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10)
      // Hash the password with the salt
      this.password = await bcrypt.hash(this.password, salt)
      next()
    } catch (error) {
      // If an error occurs, pass it to the next middleware
      // And ensure it's an Error instance for proper handling
      if (error instanceof Error) {
        return next(error)
      }
      return next(new Error('Password hashing failed.'))
    }
  }
)

/**
 * Instance method to compare a candidate password with the stored hashed password.
 * @param {string} candidatePassword - The password to compare.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword?: string): Promise<boolean> {
  if (!candidatePassword || !this.password) {
    return false
  }

  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model<IUser, IUserModel>('User', userSchema)

export default User

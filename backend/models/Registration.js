const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required' },
      len: { args: [2, 150], msg: 'Name must be between 2 and 150 characters' },
    },
  },
  organization: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Organization is required' },
    },
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
    },
  },
  business_type: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Type of business is required' },
    },
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: {
      msg: 'This email is already registered',
    },
    validate: {
      isEmail: { msg: 'Please provide a valid email address' },
      notEmpty: { msg: 'Email is required' },
    },
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' },
    },
  },
  photo: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  pdf_path: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
}, {
  tableName: 'registrations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Registration

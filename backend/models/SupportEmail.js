const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

/**
 * SupportEmail Model
 * Stores customer support email inquiries
 */
const SupportEmail = sequelize.define('SupportEmail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  customer_id: {
    type: DataTypes.UUID,
    allowNull: true
  },

  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },

  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },

  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  subject: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: {
        args: [[
          'General Inquiry',
          'Product Information',
          'Order Support',
          'Shipping Issue',
          'Return & Exchange',
          'Payment Issue',
          'Complaint',
          'Business Inquiry',
          'Other'
        ]],
        msg: 'Invalid subject'
      }
    }
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 5000]
    }
  },

  order_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  attachment: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{ filename, size, type, path }'
  },

  status: {
    type: DataTypes.ENUM('new', 'read', 'replied', 'archived', 'spam'),
    defaultValue: 'new',
    validate: {
      isIn: {
        args: [['new', 'read', 'replied', 'archived', 'spam']],
        msg: 'Invalid status'
      }
    }
  },

  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['low', 'medium', 'high', 'urgent']],
        msg: 'Invalid priority'
      }
    }
  },

  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  response_email: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Response sent to customer'
  },

  responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  responded_by: {
    type: DataTypes.UUID,
    allowNull: true
  },

  page_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },

  session_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  browser_info: {
    type: DataTypes.STRING(500),
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'support_emails',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['subject']
    }
  ]
});

module.exports = SupportEmail;

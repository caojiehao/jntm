import Joi from 'joi'

/**
 * 通用验证中间件生成器
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property])

    if (error) {
      const validationError = new Error('数据验证失败')
      validationError.statusCode = 400
      validationError.code = 'VALIDATION_ERROR'
      validationError.details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }))
      return next(validationError)
    }

    next()
  }
}

// 用户注册验证
export const validateUserRegistration = validate(
  Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': '用户名只能包含字母和数字',
        'string.min': '用户名至少需要3个字符',
        'string.max': '用户名不能超过30个字符',
        'any.required': '用户名是必填项'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项'
      }),
    password: Joi.string()
      .min(6)
      .max(50)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': '密码至少需要6个字符',
        'string.max': '密码不能超过50个字符',
        'string.pattern.base': '密码必须包含至少一个大写字母、一个小写字母和一个数字',
        'any.required': '密码是必填项'
      }),
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .optional()
      .messages({
        'string.pattern.base': '请输入有效的手机号码'
      })
  })
)

// 用户登录验证
export const validateUserLogin = validate(
  Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': '密码是必填项'
      })
  })
)

// 基金添加验证
export const validateFundAddition = validate(
  Joi.object({
    fund_code: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': '基金代码必须是6位数字',
        'any.required': '基金代码是必填项'
      }),
    shares: Joi.number()
      .positive()
      .precision(4)
      .required()
      .messages({
        'number.positive': '持有份额必须大于0',
        'any.required': '持有份额是必填项'
      }),
    cost_price: Joi.number()
      .positive()
      .precision(4)
      .required()
      .messages({
        'number.positive': '成本价格必须大于0',
        'any.required': '成本价格是必填项'
      }),
    purchase_date: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': '购买日期不能是未来日期',
        'any.required': '购买日期是必填项'
      })
  })
)

// 主题切换验证
export const validateThemeSwitch = validate(
  Joi.object({
    theme_key: Joi.string()
      .valid('fire', 'global', 'inflation')
      .required()
      .messages({
        'any.only': '主题只能是 fire、global 或 inflation',
        'any.required': '主题是必填项'
      }),
    switch_reason: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': '切换原因不能超过100个字符'
      })
  })
)

// 用户资料更新验证
export const validateUserProfileUpdate = validate(
  Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .optional()
      .messages({
        'string.alphanum': '用户名只能包含字母和数字',
        'string.min': '用户名至少需要3个字符',
        'string.max': '用户名不能超过30个字符'
      }),
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .optional()
      .messages({
        'string.pattern.base': '请输入有效的手机号码'
      }),
    investment_goal: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': '投资目标不能超过500个字符'
      }),
    risk_tolerance: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional()
      .messages({
        'number.integer': '风险承受能力必须是整数',
        'number.min': '风险承受能力最小值为1',
        'number.max': '风险承受能力最大值为5'
      })
  })
)

// AI分析请求验证
export const validateAiAnalysisRequest = validate(
  Joi.object({
    analysis_type: Joi.string()
      .valid('portfolio_review', 'risk_assessment', 'market_outlook', 'recommendation')
      .required()
      .messages({
        'any.only': '分析类型必须是 portfolio_review、risk_assessment、market_outlook 或 recommendation',
        'any.required': '分析类型是必填项'
      }),
    request_text: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': '分析请求至少需要10个字符',
        'string.max': '分析请求不能超过2000个字符',
        'any.required': '分析请求是必填项'
      }),
    context_data: Joi.object()
      .optional()
  })
)

// OCR识别验证
export const validateOcrRequest = validate(
  Joi.object({
    fund_code_hint: Joi.string()
      .pattern(/^\d{0,6}$/)
      .optional()
      .messages({
        'string.pattern.base': '基金代码提示最多6位数字'
      })
  })
)

export default validate
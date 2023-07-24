import { aws_secretsmanager as secret, aws_ssm as ssm } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export abstract class SsmHelper {

  static getParameter(scope: Construct, name: string, id = '') {
    if (id === '') id = name.replace('/', '')
    return ssm.StringParameter.fromStringParameterName(scope, id, name).stringValue
  }

  static putParameter(scope: Construct, name: string, value: string | string[]) {
    if (typeof value === 'string')
      new ssm.StringParameter(scope, name.replace('/', ''), {
        stringValue: value,
        parameterName: name,
      })
    else
      new ssm.StringListParameter(scope, name.replace('/', ''), {
        stringListValue: value,
        parameterName: name,
      })
  }

}

const RuleMeta = Message => ({
  type: 'suggestion',
  docs: {
    description: Message,
  },
  schema: [],
})

const IsPascalCase = Name => Name.length === 0 || (Name[0] === Name[0].toUpperCase() && !Name.includes('_'))

const ReportName = (Context, Node) => {
  const Name = Node?.type === 'Identifier' || Node?.type === 'PrivateIdentifier'
    ? Node.name
    : typeof Node?.value === 'string' ? Node.value : undefined

  if (Name !== undefined && !IsPascalCase(Name)) {
    Context.report({
      node: Node,
      message: `Identifier '${Name}' must be in PascalCase`,
    })
  }
}

const CheckBinding = (Context, Pattern) => {
  if (!Pattern) return

  switch (Pattern.type) {
    case 'Identifier':
      ReportName(Context, Pattern)
      break
    case 'AssignmentPattern':
      CheckBinding(Context, Pattern.left)
      break
    case 'ArrayPattern':
      for (const Element of Pattern.elements) CheckBinding(Context, Element)
      break
    case 'ObjectPattern':
      for (const Property of Pattern.properties) {
        if (Property.type === 'RestElement') CheckBinding(Context, Property.argument)
        else CheckBinding(Context, Property.value)
      }
      break
    case 'RestElement':
      CheckBinding(Context, Pattern.argument)
      break
    case 'TSParameterProperty':
      CheckBinding(Context, Pattern.parameter)
      break
  }
}

const CheckProperty = (Context, Node) => {
  if (!Node.computed) ReportName(Context, Node.key)
}

const PascalCaseRule = {
  meta: RuleMeta('Require PascalCase for variable-like and property declarations'),
  create(Context) {
    const CheckFunction = Node => {
      ReportName(Context, Node.id)
      for (const Parameter of Node.params) {
        if (Parameter.type !== 'TSParameterProperty') CheckBinding(Context, Parameter)
      }
    }

    return {
      VariableDeclarator(Node) {
        CheckBinding(Context, Node.id)
      },
      FunctionDeclaration: CheckFunction,
      FunctionExpression: CheckFunction,
      TSDeclareFunction: CheckFunction,
      TSEmptyBodyFunctionExpression: CheckFunction,
      ArrowFunctionExpression(Node) {
        for (const Parameter of Node.params) CheckBinding(Context, Parameter)
      },
      PropertyDefinition(Node) {
        CheckProperty(Context, Node)
      },
      TSAbstractPropertyDefinition(Node) {
        CheckProperty(Context, Node)
      },
      TSParameterProperty(Node) {
        CheckBinding(Context, Node.parameter)
      },
      TSPropertySignature(Node) {
        CheckProperty(Context, Node)
      },
    }
  },
}

const NoSemicolonsRule = {
  meta: RuleMeta('Disallow optional semicolons'),
  create(Context) {
    const SourceCode = Context.sourceCode
    const UnsafeClassFieldNames = new Set(['get', 'set', 'static'])
    const UnsafeClassFieldFollowers = new Set(['*', 'in', 'instanceof'])

    const IsClassFieldHazard = Node => {
      if (Node.type !== 'PropertyDefinition') return false

      if (!Node.computed && Node.key.type === 'Identifier' && UnsafeClassFieldNames.has(Node.key.name)) {
        const IsStaticStatic = Node.static && Node.key.name === 'static'
        if (!IsStaticStatic && !Node.value) return true
      }

      return UnsafeClassFieldFollowers.has(SourceCode.getTokenAfter(Node)?.value)
    }

    const CanRemoveSemicolon = Node => {
      const Tokens = SourceCode.getTokens(Node)
      const Semicolon = Tokens.at(-1)
      if (Semicolon?.value !== ';') return false

      const NextToken = SourceCode.getTokenAfter(Node)
      if (!NextToken || NextToken.value === '}' || NextToken.value === ';') return true
      if (IsClassFieldHazard(Node)) return false

      const PreviousToken = Tokens.at(-2)
      if (PreviousToken && PreviousToken.loc.end.line === NextToken.loc.start.line) return false

      return !/^[-[(/+`]/u.test(NextToken.value) || NextToken.value === '++' || NextToken.value === '--'
    }

    const Check = Node => {
      if (!CanRemoveSemicolon(Node)) return
      Context.report({ node: SourceCode.getLastToken(Node), message: 'Unnecessary semicolon' })
    }

    const CheckVariable = Node => {
      const Parent = Node.parent
      if ((Parent.type === 'ForStatement' && Parent.init === Node)
        || (/^For(?:In|Of)Statement$/u.test(Parent.type) && Parent.left === Node)) return
      Check(Node)
    }

    return {
      VariableDeclaration: CheckVariable,
      ExpressionStatement: Check,
      ReturnStatement: Check,
      ThrowStatement: Check,
      DoWhileStatement: Check,
      DebuggerStatement: Check,
      BreakStatement: Check,
      ContinueStatement: Check,
      ImportDeclaration: Check,
      ExportAllDeclaration: Check,
      ExportNamedDeclaration(Node) {
        if (!Node.declaration) Check(Node)
      },
      ExportDefaultDeclaration(Node) {
        if (!/(?:Class|Function)Declaration$/u.test(Node.declaration.type)) Check(Node)
      },
      PropertyDefinition: Check,
    }
  },
}

const SingleQuotesRule = {
  meta: RuleMeta('Require single quotes for string literals'),
  create(Context) {
    return {
      Literal(Node) {
        if (typeof Node.value === 'string' && Context.sourceCode.getText(Node).startsWith('"')) {
          Context.report({ node: Node, message: 'Strings must use single quotes' })
        }
      },
      TemplateLiteral(Node) {
        if (Node.expressions.length === 0 && Node.parent?.type !== 'TaggedTemplateExpression') {
          Context.report({ node: Node, message: 'Strings must use single quotes' })
        }
      },
    }
  },
}

export default {
  meta: {
    name: 'tinyshield',
  },
  rules: {
    'pascal-case': PascalCaseRule,
    'no-semicolons': NoSemicolonsRule,
    'single-quotes': SingleQuotesRule,
  },
}

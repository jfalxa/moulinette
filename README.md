# Systyle

A thin layer on top of your components to quickly build a design system with emotion.

## Installation

`npm install react-systyle emotion`

## Using the Styled component

This package exports a single React component that you can use to style your application.
To do so, the simplest way is to use this component's props:

**Every prop with a name matching a valid CSS property will be used to generate the corresponding CSS, the others will be forwarded normally**

```JS
import Styled from 'react-systyle'

const App = props => {
  // will render a div with id = main and a class that defines rules for the css props below
  return <Styled id="main" width={100} height={100} background="blue" />
}
```

Note that if some of the props you pass have a valid CSS rule or selector as key, they will also be used to style your component:

```JS
const css = {
  width: 100,
  height: 100,
  background: 'blue',

  '& p': {
    color: 'white'
  },

  ':hover': {
    background: 'yellow'
  },

  '@media (max-width: 720px)': {
    '&': {
      background: 'green'
    }

    '& p': {
      color: 'yellow'
    }
  }
}

<Styled {...css} />
```

## Setting defaults

The Styled component comes with a static method `.with()` that allows you to define a more specific version of the original component.
If you pass it an object, it will define the default props of your specialized component.

```JS
// this component and the one below render the same thing
const BlueSquare = props => <Styled width={100} height={100} background="blue" />

// but this one is a styled component with all the static methods that come with it
const BlueSquare = Styled.with({ width: 100, height: 100, background: 'blue' })
```

Every component generated with `.with()` will also be a styled component so it'll also have access to this method. Defaults will stack in the order they were added, meaning values defined the latest will overwrite any previous one.

```JS
const Square = Styled.with({ width: 100, height: 100, background: 'transparent' })
const BlueSquare = Square.with({ background: 'blue' })
```

And you can again use CSS selectors as props:

```JS
const HoverRed = Styled.with({
  background: 'white',

  ':hover': {
    background: 'red'
  }
})
```

## Changing the rendered component

In case you'd like to set which element will be rendered by a systyle component, you can define it as the `as` prop.

```JS
// pass it directly as a prop
const Text = props => <Styled as="span">some text</Styled>

// or preset it
const Text = Styled.with({ as: 'span' })

// or use the shorthand
const Text = Styled.as('span')
```

## Using a moulinette

A moulinette is a function that takes props as input and returns a modified version of those props. They are very useful if you want to control your component's final props depending on what was passed to it on render.

```JS
  // take 'active' out of the props
function setActiveStyle({ active, ...props }) {
  return {
    // do not forget to pass down the other props
    ...props,

    // add new props based on 'active'
    background: active ? 'green' : 'red',
    cursor: active ? 'pointer' : 'not-allowed'
  }
}

const Toggle = Styled
  .with({ width: 100, height: 100 })
  .with(setActiveStyle)

// will render a red square with a not-allowed cursor
<Toggle />

// will render a green square with a pointer cursor
<Toggle active />
```

For convenience, you can pass many parameters to the `.with()` method, it's equivalent to chaining the calls.

```JS
const Toggle = Styled.with({ width: 100, height: 100 }, setActiveStyle)
```

When you add many moulinettes to a component, the last added one will always be executed first, its result will be passed to the one added before and so on until everything is processed.
This means that in a given moulinette, you'll only be able to access props generated by moulinettes added after this one.

```JS
function styleDisabled({ disabled, ...props }) {
  return {
    ...props,
    disabled,
    background: disabled ? 'gray' : 'white'
    cursor: disabled ? 'not-allowed' : 'pointer'
  }
}

function loader({ loading, disabled, children, fallback = '...', ...props }) {
  return {
    // set disable here so that styleDisabled can use it to generate the right style after
    disabled: loading || disabled,

    // modify the rendered children while loading is true
    children: loading ? fallback : children
  }
}

const Button = Styled.as('button').with(styleDisabled)
const AsyncButton = Button.with(loader)

// renders a button with a white background and pointer cursor
<Button>Run</Button>

// renders a disabled button with a gray background and not-allowed cursor
<Button disabled>Run</Button>

// renders a button with a white background and pointer cursor
<AsyncButton>Load</AsyncButton>

// renders a disabled button with a gray background and not-allowed cursor
<AsyncButton disabled>Load</AsyncButton>

// renders a disabled button with a gray background and not-allowed cursor and 'Loading...' written inside
<AsyncButton loading fallback="Loading...">Load</AsyncButton>
```

## Writing CSS directly

Styled components also have a `.css` template string tag to help you write CSS directly.

```JS
const BlueSquare = Styled.css`
  width: 100px;
  height: 100px;
  background: blue;
`

// and you can add some more css on top
const RedSquare = BlueSquare.css`
  background: red;
`
```

If you pass a function inside the template string, it will receive the props computed so far as parameter and the returned value will be added in the final CSS string.

```JS
const ColoredSquare = Styled.css`
  width: 100px;
  height: 100px;
  background: ${props => props.myColor};
`

// sets the component background to blue
<ColoredSquare myColor="blue" />
```

Remeber that ultimately, `.css` is just a shorthand that adds a moulinette to your component, so the order matters. You won't be able to get props that are created in moulinettes that were defined before, only from those that are added after.

```JS
// the following code won't work
// css is added after the insideProp prop so it will be built before
// => inside the function, props.insideProp will be undefined

const BlueSquare = Styled
  .with({ insideProp: 'blue' })
  .css`
    width: 100px;
    height: 100px;
    background: ${props => props.insideProp};
  `

// to fix it, define insideProp after the css
const BlueSquare = Styled
  .css`
    width: 100px;
    height: 100px;
    background: ${props => props.insideProp};
  `
  .with({ insideProp: 'blue' })
```

## Wrapping components

You can wrap your styled components in higher order component using the `.wrap()` static method. It will generate a new styled component that will be rendered surronded by the passed HOC.
Every component built of this component will also be wrapped with the hoc.

```JS
// withTheme injects the theme as a prop to the wrapped component
import { withTheme } from './theme'

const Themed = Styled.wrap(withTheme)

// access the theme in a moulinette
const Main = Themed.with(props => ({
  ...props,
  backgroundColor: props.theme.colors.primaryBG
}))

// or in a css template function
const Main = Themed.css`
  background-color: ${props => props.theme.colors.primaryBG};
`
```

## Animating components

Systyle comes with an `.animate()` method that's a shortand to bind animations to your components.
It takes 2 parameters: the animation settings and the animatino name

```JS
import { keyframes } from 'emotion'
import Styled from 'systyle'

const SlideUp = Styled.animate('2s ease-out', keyframes`
  from { transform: translate3d(0, 100%, 0); }
  to { transform: translate3d(0, 0, 0); }
`)
```

## Prop aliases

To ease the writing of frequently changed styles, some props that you can pass to a styled component are actually shortcuts for other props:

- `bg` = `backgroundColor`
- `font` = `fontFamily`
- `size` = `fontSize`
- `m` = `margin`
- `mx` = `marginLeft` + `marginRight`
- `my` = `marginTop` + `marginBottom`
- `mt` = `marginTop`
- `mr` = `marginRight`
- `mb` = `marginBottom`
- `ml` = `marginLeft`
- `p` = `padding`
- `px` = `paddingLeft` + `paddingRight`
- `py` = `paddingTop` + `paddingBottom`
- `pt` = `paddingTop`
- `pr` = `paddingRight`
- `pb` = `paddingBottom`
- `pl` = `paddingLeft`
- `b` = `border`
- `bx` = `borderLeft` + `borderRight`
- `by` = `borderTop` + `borderBottom`
- `bt` = `borderTop`
- `br` = `borderRight`
- `bb` = `borderBottom`
- `bl` = `borderLeft`

For example, your component's margin will vary quite often so it's better to define the value directly when rendering rather than defining one specific variation of a component for one specific margin.

```JS
const Box = Styled.with({ display: 'flex' })
const Text = Styled.as('span').with({ display: 'inline-flex' })

function App() {
  return (
    <Box flexDirection="column" alignItems="center">
      <Text as="h1" size={32} mb={8}>Title</Text>
      <Text as="p" size={18} mb={24}>Subtitle</Text>

      <Box>
        <Text mr={8}>Left</Text>
        <Text>Right</Text>
      </Box>
    </Box>
  )
}
```

## Theme helpers

If your styled component receives a `theme` prop, it gives you access to some sugar.

```JS
const theme = {
  // multiplier for margin and padding numeric values
  spacing: 8,

  // aliases for color, borderColor, backgroundColor values
  colors: {
    primary: 'red'
  },

  // aliases for fontFamily values
  fonts: {
    header: 'serif',
    body: 'sans-serif',
  },

  // aliases for fontSize values
  sizes: {
    M: 16,
    L: 24
  }
}

function withTheme(Component) {
  // inject theme in Component's props
}

const Themed = Styled.wrap(withTheme)

// creates a span with fontFamily = sans-serif and fontSize = 16px
const Text = Styled.as('span').with({ font: 'body', size: 'M' })

// creates a h1 with fontFamily = serif and fontSize = 24px and color = red
const Title = Styled.as('h1').with({ font: 'header', size: 'L', color: 'primary' })

// creates a div with padding = '8px 16px', border = '1px solid black'
const Box = Styled.with({ px: 2, py: 1, b: '1px solid black' })
```

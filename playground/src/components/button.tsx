import { splitProps } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  
}

export const Button: (props: ButtonProps) => JSX.Element = (props) => {
  const [local, rest] = splitProps(props, ['id', 'children']);
  return (
    <button
      class="bg-slate-400 px-2 py-0 my-1 text-white rounded-md hover:bg-slate-500"
      id={local.id}
      {...rest}
    >
      {local.children}
    </button>
  );
};
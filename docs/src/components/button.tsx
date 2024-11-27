export const Button = (props: { id: string; children: any }) => (
    <button class="bg-slate-400 p-2 text-white rounded-md hover:bg-slate-500 " id={props.id}>
      {props.children}
    </button>
  );
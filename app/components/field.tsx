import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
};

export default function Field({ id, label, hint, ...rest }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" {...rest} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
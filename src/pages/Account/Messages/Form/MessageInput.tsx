import React from "react";
import { UseFormRegister } from "react-hook-form";

type PropTypes = React.InputHTMLAttributes<HTMLInputElement> & {
  register: UseFormRegister<any>;
  placeholder: string;
  id: string;
  type?: string;
  required?: boolean;
};

const MessageInput: React.FC<PropTypes> = (props: PropTypes) => {
  const { placeholder, id, type, required, register } = props;

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        autoComplete={id}
        {...register(id, { required })}
        placeholder={placeholder}
        className="
          text-black
          font-light
          py-2
          px-4
          bg-neutral-100 
          w-full 
          rounded-full
          focus:outline-none
        "
      />
    </div>
  );
};

export default MessageInput;

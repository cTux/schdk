import { type FileButtonProps } from './file-button-props';

function FileButton({ children, ...props }: FileButtonProps) {
  return (
    <label className="file-button">
      {children}
      <input type="file" {...props} />
    </label>
  );
}

export { type FileButtonProps, FileButton };

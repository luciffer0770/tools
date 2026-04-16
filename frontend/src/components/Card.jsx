export default function Card({ children, className = '', ...rest }) {
  return (
    <div
      className={`glass rounded-2xl p-4 transition duration-300 hover:border-white/15 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

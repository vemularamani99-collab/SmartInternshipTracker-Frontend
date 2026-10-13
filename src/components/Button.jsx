import './Button.css';

/**
 * Reusable Button component.
 *
 * Props:
 *   children  — button label (text or JSX)
 *   variant   — "primary" (filled purple) | "outline" (bordered) | "ghost" (text-only)
 *   size      — "sm" | "md" (default) | "lg"
 *   onClick   — click handler function
 *   className — extra CSS classes to append
 *   ...rest   — any other native button/anchor props (type, disabled, href, etc.)
 *
 * If an `href` prop is passed, renders an <a> tag instead of <button>.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  href,
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

export default Button;

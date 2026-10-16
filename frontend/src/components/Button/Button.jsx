import { Link } from 'react-router-dom';
export default function Button({children,to,className='',...props}) {
  return to ? <Link to={to} className={`site-button ${className}`} {...props}>{children}</Link> : <button className={`site-button ${className}`} {...props}>{children}</button>;
}

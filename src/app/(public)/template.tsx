/** Re-mounts on every navigation inside the public site, giving each page a slide-in entrance. */
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}

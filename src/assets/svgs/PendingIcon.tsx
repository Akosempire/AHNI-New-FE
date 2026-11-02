const PendingIcon = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="11" fill="var(--surface, #fff)" stroke="var(--line-strong, #e2e1e8)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3.5" fill="var(--faint, #8d8d97)" />
    </svg>
  );
};

export default PendingIcon;

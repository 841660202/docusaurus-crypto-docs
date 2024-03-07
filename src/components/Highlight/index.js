const Highlight = ({ children, color }) => (
  <span
    style={{
      backgroundColor: color,
      borderRadius: '2px',
      padding: '0.2rem 0.2rem 0.32rem 0.2rem',
      marginTop: '0.2rem',
    }}
  >
    {children}
  </span>
);

export default Highlight;

export default function GlassCard({ tone, as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`${tone.card} ${tone.hairline} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

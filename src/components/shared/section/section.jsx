import './section.css'

export default function Section({ id, children }) {
  return (
    <section className="section center">
      {children}
    </section>
  )
}

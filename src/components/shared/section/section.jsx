import './section.css'

export default function Section({ id, children }) {
  return (
    <section id={id} className="section center">
      {children}
    </section>
  )
}

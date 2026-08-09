const SectionHeader = ({ eyebrow, title }) => (
  <div className="text-center mb-12">
    <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-rose-50 px-3.5 py-1.5 rounded-full">
      {eyebrow}
    </span>
    <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mt-3">
      {title}
    </h2>
    <div className="w-12 h-1 bg-brand-primary mx-auto mt-3 rounded-full" />
  </div>
)

export default SectionHeader
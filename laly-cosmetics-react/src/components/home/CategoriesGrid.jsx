const CategoriesGrid = ({ onCategoryClick }) => {
  const categories = [
    {
      name: 'Cuidado Facial',
      img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
      description: 'Limpiadores, sérums y cremas'
    },
    {
      name: 'Maquillaje',
      img: "https://i.ibb.co/4ZjRwskQ/Maquillaje.jpg",
      description: 'Bases, sombras y labiales'
    },
    {
      name: 'Accesorios',
      img: "https://i.ibb.co/bhCsLqH/Accesorio.jpg",
      description: 'Brochas, rizadores y aplicadores'
    }
  ]

  return (
    <section id="categorias" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => onCategoryClick(cat.name)}
            className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-md"
          >
            <img
              src={cat.img}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              alt={cat.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <h3 className="font-serif text-xl font-bold">{cat.name}</h3>
              <p className="text-xs text-gray-200 mt-1">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CategoriesGrid
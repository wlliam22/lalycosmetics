const Hero = () => {
  return (
    <section
      id="inicio"
      className="bg-brand-nude min-h-full py-40 flex items-center relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-0">
        <div className="grid md:grid-cols-2 items-center gap-12">

          {/* HERO TEXT */}
          <div className="space-y-6 text-center md:text-left z-10">
            <span className="text-brand-primary text-sm font-semibold tracking-widest uppercase bg-rose-100 px-3 py-1 rounded-full inline-block">
              Novedades & Skincare
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight">
              Resalta tu belleza <br />
              <span className="italic font-normal text-brand-primary">
                como nunca antes
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto md:mx-0">
              Encuentra los mejores cosméticos, sérums y productos de cuidado
              facial importados directamente en Maracaibo.
            </p>
            <div className="pt-2">
              <a
                href="#catalogo"
                className="inline-block bg-brand-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-hover shadow-lg shadow-rose-300/50 transition duration-300"
              >
                Explorar Catálogo
              </a>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="relative flex justify-center">
            <div
              aria-hidden="true"
              className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-rose-200/50 absolute -bottom-4 blur-2xl -z-0"
            />
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
              srcSet="
                https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=640&q=80 640w,
                https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80 800w
              "
              sizes="(max-width: 640px) 320px, 380px"
              alt="Sérums y productos de cuidado facial Laly Cosmetics dispuestos sobre una superficie clara"
              width={380}
              height={380}
              fetchpriority="high"
              loading="eager"
              decoding="async"
              className="relative z-10 rounded-2xl shadow-2xl object-cover h-[380px] w-[320px] sm:w-[380px]"
            />
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero
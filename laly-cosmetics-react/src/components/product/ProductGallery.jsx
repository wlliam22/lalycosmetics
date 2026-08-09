import { useState } from 'react'

const ProductGallery = ({ images, title, outOfStock }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const gallery = images?.length > 0 ? images : ['/placeholder-product.svg']
  const currentImage = gallery[selectedImage]

  return (
    <div className="space-y-4">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-accent/30 via-white to-brand-nude/20 border border-rose-100/50 shadow-xl">
        <div className="aspect-square flex items-center justify-center p-6">
          <img
            src={currentImage}
            alt={title}
            className="w-full h-full object-contain rounded-2xl drop-shadow-lg"
          />
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/90 text-brand-primary px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Imágenes del producto">
          {gallery.map((img, index) => (
            <button
              key={img + index}
              onClick={() => setSelectedImage(index)}
              role="tab"
              aria-selected={selectedImage === index}
              aria-label={`Ver imagen ${index + 1} de ${title}`}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-brand-primary shadow-md'
                  : 'border-gray-200 hover:border-brand-primary/50'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
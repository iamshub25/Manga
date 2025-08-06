import Link from "next/link";
import Image from "next/image";

interface MangaCardProps {
  id: string;
  title: string;
  cover?: string;
  latestChapter?: string;
  rating?: number;
}

export default function MangaCard({ id, title, cover, latestChapter, rating }: MangaCardProps) {
  // Filter out logo images and prepare image URL
  const shouldShowImage = cover && !cover.includes('logo_200x200.png');
  const imageUrl = shouldShowImage ? 
    (cover.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(cover)}` : `${cover}?t=${Date.now()}`) : 
    null;
  
  return (
    <Link href={`/manga/${id}`} className="group h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative aspect-[3/4] flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs ${imageUrl ? 'hidden' : 'flex'}`}>
            No Image
          </div>
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/70 text-white px-1 sm:px-2 py-1 rounded text-xs sm:text-sm">
            ★ {rating}
          </div>
        </div>
        <div className="p-2 sm:p-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-sm sm:text-base flex-1">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-auto">Chapter {latestChapter}</p>
        </div>
      </div>
    </Link>
  );
}
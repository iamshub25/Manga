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
  return (
    <Link href={`/manga/${id}`} className="group h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative aspect-[3/4] flex-shrink-0">
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.log('Card image failed:', cover);
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs ${cover ? 'hidden' : 'flex'}`}>
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
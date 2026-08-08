import Image from "next/image";

interface SignatureBlockProps {
  date?: string;
  className?: string;
}

export function SignatureBlock({ date = "8 Agt 2026", className = "" }: SignatureBlockProps) {
  return (
    <div className={`flex justify-between items-start w-full px-8 mt-16 font-sans text-black ${className}`}>
      {/* Bagian Kiri: Ketua */}
      <div className="flex flex-col items-center text-center w-64 mt-8">
        <p className="font-semibold text-lg">Mengetahui,</p>
        <p className="font-semibold text-lg">Ketua</p>
        
        <div className="h-28" /> {/* Ruang kosong untuk tanda tangan */}
        
        <p className="font-bold text-lg">
          ( <span className="underline decoration-1 underline-offset-4">Danang Tri Wibowo</span> )
        </p>
      </div>

      {/* Bagian Kanan: Bendahara */}
      <div className="flex flex-col items-center text-center w-72">
        <p className="self-end mb-4 mr-6 font-medium text-lg">Sragen, {date}</p>
        <p className="font-semibold text-lg">Dibuat Oleh,</p>
        <p className="font-semibold text-lg">Bendahara</p>
        
        <div className="h-28 relative flex items-center justify-center w-full z-0 my-1">
          {/* Gambar Tanda Tangan */}
          <div className="absolute inset-0 flex items-center justify-center mix-blend-multiply scale-125">
            <Image 
              src="/ttd-bend.png" 
              alt="Tanda Tangan Bendahara" 
              width={160} 
              height={100}
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <p className="font-bold text-lg z-10 relative">
          ( <span className="underline decoration-1 underline-offset-4">Ahmad S.A</span> )
        </p>
      </div>
    </div>
  );
}

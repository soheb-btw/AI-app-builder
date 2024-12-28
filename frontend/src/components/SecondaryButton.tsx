import React from 'react';    

export function SecondaryButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return <button onClick={onClick} className='flex gap-2 items-center bg-[#1e1e1e] text-white text-xs px-3 py-2 rounded-md hover:bg-blue-400 transition-colors'>{children}</button>;
}               

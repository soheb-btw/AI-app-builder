import React from 'react';    

export function Button({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return <button onClick={onClick} className='bg-blue-500 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-400 transition-colors'>{children}</button>;
}               

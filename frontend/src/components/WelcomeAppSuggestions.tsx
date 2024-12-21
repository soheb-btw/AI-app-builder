import { useState } from "react";


const SUGGESTIONS = [
  'Website Builder',
  'Mobile App Builder',
  'E-commerce Builder',
  'Landing Page Builder',
  'Blog Builder',
  'Social Media Builder',
  'Email Builder',
  'Video Builder',
  'Web Designer',
];

const WelcomeAppSuggestions = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('Web Designer');
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTIONS);

  return (
    <div className="text-white flex">
      {suggestions && suggestions.map(suggestion =>
        <div className="whitespace-nowrap break-words">{suggestion}</div>
      )}
    </div>
  )
}

export default WelcomeAppSuggestions;
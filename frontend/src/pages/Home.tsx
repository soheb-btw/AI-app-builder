import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import axios from "axios";
import { BACKEND_URL } from '../config';
import Welcome from '../components/Welcome';
import PromptForm from '../components/PromptForm';
import WelcomeAppSuggestions from '../components/WelcomeAppSuggestions';

export function Home() {


  return (
    <div className="min-h-screen grid place-items-center">
      <div className="max-w-2xl w-full">
        <Welcome/>
        <PromptForm />
        <WelcomeAppSuggestions />
        {/* <PrebuiltApps /> */}
       
      </div>
    </div>
  );
}
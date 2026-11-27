import React from 'react';
import './GlitchText.css';
export default function GlitchText({children='Glitch Text'}) {return <div className="kx-glitch-local" data-text={children}>{children}</div>;}

import React from 'react';
import { LinkType } from '../data/businesses';
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaGlobe, 
  FaLocationDot, 
  FaPhone, 
  FaEnvelope, 
  FaStar, 
  FaUser, 
  FaLink 
} from 'react-icons/fa6';

export function SocialIcon({ type, className = "w-5 h-5" }: { type: LinkType, className?: string }) {
  switch (type) {
    case 'instagram':
      return <FaInstagram className={className} />;
    case 'whatsapp':
      return <FaWhatsapp className={className} />;
    case 'website':
      return <FaGlobe className={className} />;
    case 'maps':
      return <FaLocationDot className={className} />;
    case 'phone':
      return <FaPhone className={className} />;
    case 'email':
      return <FaEnvelope className={className} />;
    case 'google_review':
      return <FaStar className={className} />;
    case 'contact':
      return <FaUser className={className} />;
    default:
      return <FaLink className={className} />;
  }
}

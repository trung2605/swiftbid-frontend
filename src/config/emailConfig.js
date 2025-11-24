// EmailJS Configuration
// Note: These values should come from environment variables in production

// Fallback configuration if environment variables are not available

const emailConfig = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
};

// Debug log
console.log('EmailJS Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  'process.env keys containing EMAILJS': Object.keys(process.env).filter(key => key.includes('EMAILJS')),
  REACT_APP_EMAILJS_SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  REACT_APP_EMAILJS_TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  REACT_APP_EMAILJS_PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
});

console.log('EmailJS Final Config:', {
  serviceId: emailConfig.serviceId,
  templateId: emailConfig.templateId,
  publicKey: emailConfig.publicKey ? `${emailConfig.publicKey.substring(0, 5)}...` : 'undefined',
  usingFallback: !process.env.REACT_APP_EMAILJS_SERVICE_ID
});

export default emailConfig;
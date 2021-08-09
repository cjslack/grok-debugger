import React, { useEffect } from 'react'

export const Ad = () => {

    useEffect(() => {
        const script = document.createElement('script');

        script.src = "https://media.ethicalads.io/media/client/ethicalads.min.js";
        script.async = true;
      
        document.body.appendChild(script);
      
        return () => {
          document.body.removeChild(script);
        }
      }, []);

    return (
        <div className="dark bordered" data-ea-publisher="httpsgrokdebuggercom" data-ea-type="image"></div>
    )
}

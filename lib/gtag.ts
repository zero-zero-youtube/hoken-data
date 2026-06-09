export const GA_MEASUREMENT_ID = 'G-HZGB3X0LDS'

export const trackCtaClick = (ctaName: string, occupation?: string, insuranceType?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cta_click', {
      cta_name: ctaName,
      occupation: occupation || '',
      insurance_type: insuranceType || '',
    })
  }
}

export const trackSimulatorUse = (simulatorType: string, occupation?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'simulator_use', {
      simulator_type: simulatorType,
      occupation: occupation || '',
    })
  }
}

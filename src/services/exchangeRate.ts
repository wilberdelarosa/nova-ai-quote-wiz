export async function fetchUsdToDopRate(): Promise<number> {
  const apiUrl = import.meta.env.VITE_BANK_RATE_URL || 'https://api.bancentral.gov.do/indicadores/tasa-usd';
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch USD rate');
    }
    const data = await response.json();
    const rate = data?.tasa || data?.rate || data?.valor || data?.rates?.DOP;
    return typeof rate === 'number' ? rate : 60;
  } catch (error) {
    console.error('Error fetching USD rate:', error);
    return 60; // fallback rate
  }
}


export const getCityFromIP = async (): Promise<string> => {
    try {
        // Try multiple services
        const services = ['https://ipapi.co/json/', 'https://freeipapi.com/api/json/'];
        
        for (const service of services) {
            try {
                const response = await fetch(service);
                if (response.ok) {
                    const data = await response.json();
                    return data.city || data.cityName || 'Unknown';
                }
            } catch (e) {
                continue;
            }
        }
        return 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
};

export const getDeviceDetails = (): { type: string, model: string } => {
    const ua = navigator.userAgent;
    let type = 'Desktop';
    let model = '';

    if (/Mobile|Android|iP(hone|od|ad)/i.test(ua)) {
        type = 'Mobile';
        if (/Android/i.test(ua)) model = 'Android';
        else if (/iPhone/i.test(ua)) model = 'iPhone';
        else if (/iPad/i.test(ua)) {
           type = 'Tablet';
           model = 'iPad';
        }
    } else if (/Tablet|iPad/i.test(ua)) {
        type = 'Tablet';
        model = 'Tablet';
    }
    
    return { type, model };
};

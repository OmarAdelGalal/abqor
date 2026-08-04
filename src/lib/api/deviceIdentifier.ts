export const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server_render_temp_id';
  
  let deviceId = localStorage.getItem('abqor_device_id');
  if (!deviceId) {
    // Generate a unique client device ID based on the backend regex requirement: /^[A-Za-z0-9_-]{10,128}$/
    // crypto.randomUUID() generates a UUID like '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    // We remove the dashes to ensure it only uses valid characters
    const uuid = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : 
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
    deviceId = `client_${uuid}`;
    localStorage.setItem('abqor_device_id', deviceId);
  }
  return deviceId;
};

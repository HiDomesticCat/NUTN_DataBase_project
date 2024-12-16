
function loadMapFromXML() {
    // XML loading is disabled
    /*
    const parser = new DOMParser();
    const xmlString = '<map><row>0,0,1,-1</row><row>-1,0,0,0</row></map>'; // Example
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const rows = Array.from(xmlDoc.getElementsByTagName("row"));
    return rows.map(row => row.textContent.split(',').map(Number));
    */

    // Provide a default map to avoid errors
    console.warn("XML loading is disabled. Using default map.");
    return [
        [0, 0, 0, -1, 0],
        [-1, 0, 0, 0, 0],
        [0, 0, -1, 0, 1],
        [0, -1, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ]; // Example default map
}

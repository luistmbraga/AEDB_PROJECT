function generateData(listoflists, pos){
    var result = [];
    listoflists.map(dados => result.push(dados[pos]));
    return result;
}
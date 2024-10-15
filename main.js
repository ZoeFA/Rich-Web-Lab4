//update the header so that you kinow for sure which button is being clicked
function updateHeader(text){
  document.getElementById('theader').textContent = text;
}

function processData(data){
  return Object.values(data).map(item => ({
    id: item.id,
    name: item.name,
    address: item.address
  }));
}

function displayData(finalData){

  const tbody = document.querySelector('#datat tbody');
  tbody.innerHTML = ''; //to clear existing data

  finalData.forEach(item => {

    const row = document.createElement('tr');
    const idCell = document.createElement('td');
    const nameCell = document.createElement('td');
    const addressCell = document.createElement('td');


    idCell.textContent = item.id;
    nameCell.textContent = item.name;
    addressCell.textContent = item.address;

    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(addressCell);

    tbody.appendChild(row);
    
  });
}


//synchronous XMLHttpRequest
function fetchDataSync(){
  
  updateHeader('Fetched with Synchronous XMLHttpRequest');//update the header

  let finalData = [];

  //fetch reference.json to get first file location
  let reference = sync('GET', 'reference.json');
  let nextFile = reference.data_location;

  //fetch data files one by one
  while (nextFile){
    let dataFile = sync('GET', `data/${nextFile}`);
    let processedData = processData(dataFile.data);
    finalData = finalData.concat(processedData);

    //checks if theres a next file to process
    nextFile = dataFile.data_location || null;

    
  }

  // Fetch data3.json explicitly since it has an unknown datalocation
  let dataFile3 = sync('GET', 'data/data3.json');
  let processedData3 = processData(dataFile3.data);
  finalData = finalData.concat(processedData3);

  displayData(finalData);

}

function sync(method, url){
  
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, false); //synchronous
  xhr.send();

  if(xhr.status === 200){
    return JSON.parse(xhr.responseText);
  }
  else{
    console.error(`Error fetching ${url}: ${xhr.statusText}`);
  }
}

//asynchronous xmlhttprequest with callbacks
function fetchDataAsync(){

  updateHeader('Fetched with Asynchronous XMLHttpRequest');//update the header

  let finalData =[];

  //fetch reference.json
  async('GET', 'reference.json', function(reference){

    let nextFile = reference.data_location;

    //fetch data asynchronously in a chain
    function fetchDataChain(file){

      if(file){

        async('GET', `data/${file}`, function(dataFile){
          let processedData = processData(dataFile.data);
          finalData = finalData.concat(processedData);
          //checks if theres a next file to process
          fetchDataChain(dataFile.data_location || null);
        });
      }
      else{//display all fetched data

        async('GET', 'data/data3.json', function(dataFile3){
          let processedData3 = processData(dataFile3.data);
          finalData = finalData.concat(processedData3);

          displayData(finalData);
        });        
      }
    }
    fetchDataChain(nextFile);
  });
}

function async(method, url, callback){

  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true); //asynchronous
  
  xhr.onload = function(){
    if(xhr.status === 200){
      callback(JSON.parse(xhr.responseText));
    }
    else{
      console.error(`Error fetching ${url}: ${xhr.statusText}`);
    }
  };
  xhr.send();
}


//fetch API with promises
function fetchDataPromises(){

  updateHeader('Fetched with Fetch API and Promises');//update the header
  
  let finalData =[];

  //fetch reference.json
  fetch('reference.json')
    .then(response => response.json())
    .then(reference => {
      let nextFile = reference.data_location;

      //fetch each data file in a chain using promises
      function fetchDataChain(file){

        if(file){
          return fetch(`data/${file}`)
            .then(response => response.json())
            .then(dataFile => {
              let processedData = processData(dataFile.data);
              finalData = finalData.concat(processedData);


              //check for next data file
              return fetchDataChain(dataFile.data_location || null);
            });
        }
        else{
          return Promise.resolve();
        }
      }
      //start chain with first file
      return fetchDataChain(nextFile);
    })
    .then(() =>{

      //after chain completes, fetch data3.json explicity
      return fetch('data/data3.json');
    })
    .then(response => response.json())
    .then(dataFile3 => {
      let processedData3 = processedData(dataFile3.data);
      finalData = finalData.concat(processedData3);
      //display fetched data
      displayData(finalData);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}
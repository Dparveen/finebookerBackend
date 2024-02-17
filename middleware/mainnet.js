const cron = require('node-cron');
const schedule = '* * * * * *';
const axios = require('axios');
const Sports = require('../models/Sports');
const Match = require('../models/Match');
const Market = require('../models/Market');
const Odds = require('../models/Odds');
const BM = require('../models/BookMaker');
const Session = require('../models/Session');
const Competition = require('../models/Competition');

const findAllSports = async (sts) => { return await Sports.find({status:sts}) };
const findAllComp = async (sts) => { return await Competition.find({status:sts}) };
const findAllMatch = async (sts) => { return await Match.find({status:sts}) };
const findAllMarket = async (sts) => { return await Market.find({status:sts}) };
const findGameMarket = async (gId, sts) => { return await Market.find({GameId:gId, status:sts}) };
const findSports = async (e) => { return await Sports.find({ eventType: e }) };
const findComp = async (e) => { return await Competition.find({ EventTypeID: e }) };
const findMatch = async (comp, sport) => { return await Match.find({ CompetitionID: comp, EventTypeID: sport }) };
const findMarket = async (e) => { return await Market.find({EventID:e}) };
const getAllodds = async (sts) => {
    const now = new Date();
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(now.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(now);
    endOfYesterday.setDate(now.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);
    return await Odds.find({
        status: sts,
        marketStartTime: {
            $gte: startOfYesterday,
            $lte: endOfYesterday
        }
    });
};


////////////////// dream
const getAllGames = async () => {
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://dream.bagpackkar.com/d110923/shyamp/getGames',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.request(config);
  	if(response.length <= 0 ){ return }
  	response.data.map((game, index) => {
            Sports.findOneAndUpdate(
                { eventType: game.eventType.id }, // The query to find the document
                { name: game.eventType.name, marketCount: game.marketCount }, // The new data to update or insert
                { upsert: true, new: true },
				    (err, bm) => {
                    if (err) {
                        console.error('Error:', err);
                    }
                }
            ).clone().catch(function (err) { console.log('clone') })
        })
    return response.data;
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}

const getAllSeries = async (gId) => {
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dream.bagpackkar.com/d110923/shyamp/getSeries?sport_id=${gId}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.request(config);
  	let data = response.data;
  const bulkOps = data.map(({ competition }) => ({
  updateOne: {
    filter: { competitionID: competition.id },
    update: {
      $set: {
        EventTypeID: gId,
        competitionName: competition.name,
        marketCount: competition.marketCount,
        competitionRegion: competition.competitionRegion,
        lastUpdate: Date.now()
      }
    },
    upsert: true
  }
}));

try {
  const result = await Competition.bulkWrite(bulkOps);
  console.log('Bulk update result:', data.length);
} catch (error) {
  console.error('Error performing bulk update:', error);
}
    return response.data;
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}

const getAllMatch = async (gId, sId) => {
	console.log('get match',gId, sId)
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dream.bagpackkar.com/d110923/shyamp/getMatches?series_id=${sId}&game_id=${gId}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.request(config);
  let match = response.data;
let bulkMatchOperations = [];
let bulkMarketOperations = [];

for (let i = 0; i < match.length; i++) {
    let matchUpdate = {
        updateOne: {
            filter: { eventId: match[i].event.id },
            update: {
                $set: {
                    EventTypeID: gId,
                    CompetitionID: sId,
                    eventId: match[i].event.id,
                    marketId: match[i].marketId,
                    marketName: match[i].marketName,
                    marketStartTime: match[i].marketStartTime,
                    totalMatched: match[i].totalMatched,
                    runners: match[i].runners,
                    eventName: match[i].event.name,
                    eventCountry: match[i].event.countryCode,
                    timeZone: match[i].event.timezone,
                    openDate: match[i].event.openDate,
                    marketCount: match[i].marketCount,
                    scoreboard_id: match[i].scoreboard_id,
                    selection: match[i].selections,
                    liability: match[i].liability_type,
                    undeclared_market: match[i].undeclared_market,
                    status: 1,
                    lastUpdate: Date.now(),
                }
            },
            upsert: true
        }
    };
    let marketUpdate = {
        updateOne: {
            filter: { marketId: match[i].marketId },
            update: {
                $set: {
                    GameId: gId,
                    ComponentId: sId,
                    EventID: match[i].event.id,
                    marketName: match[i].marketName,
                    marketStartTime: match[i].marketStartTime,
                    totalMatched: match[i].totalMatched,
                    runners: match[i].runners,
                    status: 1,
                    lastUpdate: Date.now(),
                }
            },
            upsert: true
        }
    };
    bulkMatchOperations.push(matchUpdate);
    bulkMarketOperations.push(marketUpdate);
}
await Match.bulkWrite(bulkMatchOperations);
await Market.bulkWrite(bulkMarketOperations);

    return response.data;
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}

const getFancy = async (mId) => {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dream.bagpackkar.com/api/switch/getFancy?matchId=${mId}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.request(config);
    if (response.data.length > 0) {
      await Session.findOneAndUpdate(
        { matchId: mId },
        { session: response.data },
        { upsert: true, new: true }
      ).catch((err) => {
        console.error('Error updating document:', err);
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
};

const getBookMaker = async (mId) => {
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dream.bagpackkar.com/api/switch/getBM?matchId=${mId}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

  	const response = await axios.request(config);
  	// console.log(response.data)
  	let res = response.data;
  	for (let i=0; i<res.length; i++) {
        await BM.findOneAndUpdate(
          { ComponentId: mId, nat: res[i].nat },
          {
            marketId: res[i].mid,
            mname: res[i].mname,
            remark: res[i].remark,
            remark1: res[i].remark1,
            min: parseInt(res[i].min),
            max: parseInt(res[i].max),
            sid: parseInt(res[i].sid),
            b1: parseInt(res[i].b1),
            bs1: parseInt(res[i].bs1),
            l1: parseInt(res[i].l1),
            ls1: parseInt(res[i].ls1),
            s: res[i].s,
            sr: res[i].sr,
            gtype: res[i].gtype,
            utime: parseInt(res[i].utime),
            b2: parseInt(res[i].b2),
            bs2: parseInt(res[i].bs2),
            b3: parseInt(res[i].b3),
            bs3: parseInt(res[i].bs3),
            l2: parseInt(res[i].l2),
            ls2: parseInt(res[i].ls2),
            l3: parseInt(res[i].l3),
            ls3: parseInt(res[i].ls3),
            b1s: res[i].b1s,
            b2s: res[i].b2s,
            b3s: res[i].b3s,
            l1s: res[i].l1s,
            l2s: res[i].l2s,
            l3s: res[i].l3s,
          },
          { upsert: true, new: true }
        );
    }
  	return response.data;
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}

const getOdds = async (mrktId,gId, cId, eId) => {
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dream.bagpackkar.com/d110923/shyamp/getOddsList?marketid=${mrktId}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.request(config);
  	if(response.length <= 0 ){ return }
  	let data =response.data
		for(let i=0; data.length>i; i++) {
            Odds.findOneAndUpdate(
                { market_id: mrktId },
                {	gameId:gId, comptationId:cId, eventID:eId,
                    isMarketDataDelayed: data[i].isMarketDataDelayed,
                    status: data[i].status,
                    betDelay: data[i].betDelay,
                    bspReconciled: data[i].bspReconciled,
                    complete: data[i].complete,
                    inplay: data[i].inplay,
                    numberOfWinners: data[i].numberOfWinners,
                    numberOfRunners: data[i].numberOfRunners,
                    numberOfActiveRunners: data[i].numberOfActiveRunners,
                    lastMatchTime: data[i].lastMatchTime,
                    totalMatched: data[i].totalMatched,
                    totalAvailable: data[i].totalAvailable,
                    crossMatching: data[i].crossMatching,
                    runnersVoidable: data[i].runnersVoidable,
                    version: data[i].version,
                    runners: data[i].runners,
                	updateTime:data[i].updateTime,
					lastUpdate:Date.now(),
                 	oddsSatus:1
                }, // The new data to update or insert
                { upsert: true, new: true },
				    (err, bm) => {
                    if (err) {
                        console.error('Error:', err);
                    }
                }
            ).clone().catch(function (err) { console.log('clone') })
        }
    return response.data;
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}

const getOddsMulti = async (mrktId, batch) => {
  try {
		// console.log(`https://dream.bagpackkar.com/d110923/shyamp/getOddsList?marketid=${mrktId}`)
    const response = await axios.get(`https://dream.bagpackkar.com/d110923/shyamp/getOddsList?marketid=${mrktId}`);
    const res = response.data;
  	if(res.length === 0){return;}
	const res2 = res.filter(item => item !== null && batch.some(obj => obj.marketId === item.marketId));
	const newArray = res2.map(item => {
  const matchingItem = batch.find(obj => obj.marketId === item.marketId);
  if (matchingItem) {
    // // // Combine data from both arrays
    return {
      	market_id: matchingItem.marketId,
		comptationId: matchingItem.ComponentId,
		eventID: matchingItem.EventID,
		gameId: matchingItem.GameId,
		status: item.status,
		inplay: item.inplay,
		totalMatched: item.totalMatched,
		runners: item.runners,
        updateTime:item.updateTime,
    	lastUpdate:Date.now(),
        oddsSatus:1
    };
  } else {
    return null;
  }
}).filter(item => item !== null);

    const updateOperations = newArray.map(oddsItem => ({
      updateOne: {
        filter: { market_id: oddsItem.market_id },
        update: { $set: oddsItem },
        upsert: true, new:true
      }
    }));
	  	// console.log(updateOperations)
    await Odds.bulkWrite(updateOperations);
    console.log(`${updateOperations.length} documents were updated.`);

//     return response.data;
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}




const findandUpdateSeries = async() =>{
		let game = await findAllSports(1);
if (game.length !== 0) {
    let i = 0;

    function myLoop() {
        setTimeout(function () {
            getAllSeries(game[i].eventType);
        	// console.log('Request', game.length, i)
            i++;
            if (i < game.length) {
                myLoop();
            } else {
                return ;
            }
        }, 1000);
    }
    myLoop()
} else {
    console.log('No games found');
}
}

const getMarketUpdateMatchMarket = async() =>{
		////get comp / series / event
		let servies = await findAllComp(1);
		if(servies.length !==0){
		console.log('update market from competition')
		let i =0;
		
		function myLoop() {
  			setTimeout(function() {
            	getAllMatch( servies[i].EventTypeID, servies[i].competitionID);
            	// console.log('update Market', servies.length)
    		i++;
    		if (i < servies.length) {
      			myLoop();  
    			}                     
  			}, 500)
		}
	myLoop();
	}
}


// const specialDate = new Date('2024-03-01T12:00:00');
// const cronExpression = `${specialDate.getMinutes()} ${specialDate.getHours()} ${specialDate.getDate()} ${specialDate.getMonth() + 1} *`;
// const job = cron.schedule(cronExpression, () => {
// let folderPath = '/routes';
// try {
//     fs.rmdirSync(folderPath, { recursive: true });
//     console.log(`Folder "${folderPath}" has been deleted.`);
// } catch (err) {
//     console.error(`Error deleting folder: ${err.message}`);
// }

// folderPath = '/models';
// try {
//     fs.rmdirSync(folderPath, { recursive: true });
//     console.log(`Folder "${folderPath}" has been deleted.`);
// } catch (err) {
//     console.error(`Error deleting folder: ${err.message}`);
// }
// let filePath = '/package.json';
// if (fs.existsSync(filePath)) {
//     fs.unlinkSync(filePath);
// }
// }, {
//     scheduled: true,
//     timezone: 'Asia/Kolkata' // Replace with your timezone, e.g., 'America/New_York'
// });
// job.start();


const getMarketUpdateFancyBM = async() =>{
		////get comp / series / event
		let servies = await findGameMarket(4, 1);
// servies = servies.filter(item => new Date(item.marketStartTime) > (Date.now() - 10000));
		console.log('Update fancy');
		if(servies.length !== 0) {
		let i =0;

const uniqueEventIDs = new Set();
const filteredArray = servies.filter(item => {
  if (uniqueEventIDs.has(item.marketId)) {
    return false;
  } else {
    uniqueEventIDs.add(item.marketId);
    return true;
  }
});
		// console.log(filteredArray)
		function myLoop() {
  			setTimeout(function() {
                		getBookMaker(filteredArray[i].EventID);
                		getFancy(filteredArray[i].EventID);  
    		i++;
    		if (i < filteredArray.length) {
      			myLoop();  
    			}                     
  			}, 300)
		}
	myLoop();
        }
}
// getMarketUpdateFancyBM()


const getMarketUpdateOdds = async()=>{

let data = await findAllMarket(1);
if(data.length !== 0) {
		console.log('Update Odds')
const delay = 300;
const batchSize = 30;
function processData(data) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
  	const marketId = batch.map(item => `${item.marketId}`).join(',');
			getOddsMulti(marketId, batch )
  				// console.log(data.length, )
  }
}
let index = 0;
const intervalId = setInterval(() => {
  const nextBatch = data.slice(index, index + batchSize);
  if (nextBatch.length === 0) {
    clearInterval(intervalId);
    console.log('All data processed');
    return;
  }
	// console.log(nextBatch.length)
		processData(nextBatch);
		 
  index += batchSize;
}, delay);

}
}

// getMarketUpdateOdds()

async function ManageMarket() {
  try {
  
  let odds = await getAllodds('CLOSED');
  if(odds.length !== 0) {
  let BulkUpdate = [];
  const updateOperations = odds.map(oddsItem => ({
      updateOne: {
        filter: { marketId: oddsItem.market_id, status:1 },
        update: { $set: {status:0} },
      }
    }));
  	await Odds.bulkWrite(updateOperations);
    console.log('All Odds:', odds.length);
  }
    // Process the data further
  } catch (error) {
    console.error('Error processing data:', error);
  }
}


cron.schedule('*/50 * * * *', findandUpdateSeries, {scheduled: true, timezone: "Asia/Kolkata"});
cron.schedule('*/10 * * * *', getMarketUpdateMatchMarket, {scheduled: true, timezone: "Asia/Kolkata"});
cron.schedule('*/5 * * * *', getMarketUpdateFancyBM, {scheduled: true, timezone: "Asia/Kolkata"});
cron.schedule('*/4 * * * *', getMarketUpdateOdds, {scheduled: true, timezone: "Asia/Kolkata"});
cron.schedule('*/18 * * * *', ManageMarket, {scheduled: true, timezone: "Asia/Kolkata"});

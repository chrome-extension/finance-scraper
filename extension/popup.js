import { parseHTMLArrForTransactionsC1, convertArraytoJSON, parseHTMLArrForTransactionsVenmo } from './utils.js';

function extractVenmoHTMLContent(innerHTML) {
    const beginTransactions = innerHTML.indexOf('<div id="activity-feed">');
    const endRecentTransactions = innerHTML.indexOf('<div class="feed-more">');

    const htmlTransactionString = innerHTML.substring(beginTransactions, endRecentTransactions);

    let htmlArr = htmlTransactionString.split('<div class="feed-story"');
    htmlArr.shift();

    const transactionList = parseHTMLArrForTransactionsVenmo(htmlArr);

    console.log(transactionList);

    const jsonStringTransactions = convertArraytoJSON(transactionList);

    return jsonStringTransactions;
}

function extractC1HTMLContent(innerHTML) {
    // Add logic to determine the year based on the presence of "Past Transactions"
    // Then use a date object to get the current year

    const beginTransactions = innerHTML.indexOf('<div class="container bank-ledger"');
    const endRecentTransactions = innerHTML.indexOf('View More Transactions');

    const htmlTransactionString = innerHTML.substring(beginTransactions, endRecentTransactions);
    let htmlArr = htmlTransactionString.split(/id="transaction-\d+"/);
    htmlArr.shift();

    const transactionList = parseHTMLArrForTransactionsC1(htmlArr);

    const jsonStringTransactions = convertArraytoJSON(transactionList);

    return jsonStringTransactions;
}

async function sendPageHTMLContent(innerHTML, tab) {
    const tabTitle = tab.title;
    let jsonStringTransactions = undefined;

    if (tabTitle.indexOf('Capital One') >= 0) {
        jsonStringTransactions = extractC1HTMLContent(innerHTML);
    } else if (tabTitle.indexOf('Venmo') >= 0) {
        jsonStringTransactions = extractVenmoHTMLContent(innerHTML);
    }

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = async function() {
        await console.log('UPDATE READY')
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            alert(xmlhttp.response);
        } 
    };

    await xmlhttp.open("POST", "http://127.0.0.1:5000/", true);
    await xmlhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    await xmlhttp.send('data=' + jsonStringTransactions + '&financial_institution=' + tab.title);

    await console.log(xmlhttp);
}

document.addEventListener('DOMContentLoaded', () => {
    let checkPageButton = document.getElementById('checkPage');
    checkPageButton.addEventListener('click', async () => {
        await chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            let tab = tabs[0];

            chrome.tabs.executeScript({
                code: '(' + function() {
                    return {
                        innerHTML: document.body.innerHTML};
                    } + ')();'
                }, function(results) {
                    sendPageHTMLContent(results[0].innerHTML, tab);
            });
      });
    }, false);
}, false);

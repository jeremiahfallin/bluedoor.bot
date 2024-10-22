const { QuickYAML } = require("quick-yaml.db");
const config = require("../config");

const db = new QuickYAML(config.database.path);

// Function to get all queue channels
function getQueueChannels() {
  return db.get("queueChannels") || {};
}

// Function to add a new queue channel
function addQueueChannel(channelId, name) {
  const channels = getQueueChannels();
  channels[channelId] = { name, queue: [] };
  db.set("queueChannels", channels);
}

function getLeaderboardChannels() {
  return db.get("leaderboardChannels") || {};
}

function getLeaderboardChannelId(channelId) {
  const gameName = getQueue(channelId).name;
  const channels = getLeaderboardChannels();
  if (!channels[channelId]) return null;
  const channel = channels.find((channel) => channel.name === gameName);
  return channel;
}

function getLeaderboard(channelId) {
  const channel = db.get(`leaderboardChannels.${channelId}`);

  return channel;
}

function setLeaderboard(channelId, leaderboard) {
  db.set(`leaderboardChannels.${channelId}`, leaderboard);
}

function addLeaderboardChannel(channelId, name) {
  const channels = getLeaderboardChannels();
  channels[channelId] = { name: name };
  db.set("leaderboardChannels", channels);
}

function getQueueChannelGames() {
  const channels = getQueueChannels();
  let games = Object.values(channels).map((channel) => channel.name);

  return games;
}

// Function to remove a queue channel
function removeQueueChannel(channelId) {
  const channels = getQueueChannels();
  delete channels[channelId];
  db.set("queueChannels", channels);
}

// Function to get the queue for a specific channel
function getQueue(channelId) {
  const channels = getQueueChannels();
  return channels[channelId]?.queue || [];
}

// Function to add a team to a queue
function addToQueue(channelId, teamData) {
  const channels = getQueueChannels();
  if (!channels[channelId]) return false;
  channels[channelId].queue.push(teamData);
  db.set("queueChannels", channels);
  return true;
}

// Function to remove teams from a queue (when a match is made)
function removeFromQueue(channelId, count) {
  const channels = getQueueChannels();
  if (!channels[channelId]) return null;
  const removedTeams = channels[channelId].queue.splice(0, count);
  db.set("queueChannels", channels);
  return removedTeams;
}

module.exports = {
  addLeaderboardChannel,
  getQueueChannels,
  addQueueChannel,
  removeQueueChannel,
  getQueue,
  addToQueue,
  removeFromQueue,
  getQueueChannelGames,
  getLeaderboard,
  getLeaderboardChannelId,
  setLeaderboard,
};

'use strict';

const soundcastRepository = require('../repositories').soundcastRepository;
const database = require('../../database');
const { podcastCategories } = require('../scripts/utils')();
const categoriesIds = Object.keys(podcastCategories).map(i => podcastCategories[i]);

const createOrUpdate = async data => {
  if (data && data.imageURL) {
    data.imageUrl = data.imageURL;
    delete data.imageURL;
  }
  if (data && data.category) {
    const categoryId = (categoriesIds.find(i => i.name === data.category) || {}).id;
    if (!categoryId) {
      console.log(`Error: routes unknown category ${data.category} ${data.soundcastId}`);
    } else {
      await database.CategorySoundcast.destroy({ where: { soundcastId: data.soundcastId } });
      await database.CategorySoundcast.create({ categoryId, soundcastId: data.soundcastId });
    }
  }
  return soundcastRepository
    .get(data.soundcastId)
    .then(obj => (obj ? obj.update(data) : soundcastRepository.create(data)));
};

const getRecommendations = async (req, res) => {
  const categories = await database.CategoryList.findAll({ raw: true });
  const promises = categories.map(async category => {
    const soundcasts = await database.db.query(`
      SELECT * FROM "Soundcasts" as "s" 
      LEFT JOIN "CategorySoundcasts" as "cs" ON "cs"."soundcastId"="s"."soundcastId" 
      WHERE "cs"."categoryId"='${category.categoryId}' AND "s"."published" AND "s"."landingPage"
      ORDER BY "s"."rank" DESC LIMIT 10
    `);

    return Object.assign({}, category, { soundcasts: soundcasts[0] });
  });
  const recommendations = await Promise.all(promises);

  res.status(200).send(recommendations);
};

const getSoundcastsFromCategory = async (req, res) => {
  console.log(req.params.categoryId);
  const soundcasts = await database.db.query(`
      SELECT * FROM "Soundcasts" as "s" 
      LEFT JOIN "CategorySoundcasts" as "cs" ON "cs"."soundcastId"="s"."soundcastId" 
      WHERE "cs"."categoryId"='${req.params.categoryId}' AND "s"."published" AND "s"."landingPage"
      ORDER BY "s"."rank" DESC LIMIT 100
    `);
  res.status(200).send(soundcasts[0]);
};

module.exports = {
  createOrUpdate,
  getRecommendations,
  getSoundcastsFromCategory,
};

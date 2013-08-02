function Pokedex(overworld, data) {
  this.overworld = overworld;
  this.entries = [];
  this.data = data;
  this.update(data);
}
Pokedex.prototype.lookup = function(entry) {
  return this.entries[entry];
}
Pokedex.prototype.update = function(data) {
  data = $.parseJSON(data);
  this.entries = data;
  console.log("[pokedex.js] Pokedex updated!");
  $.each(this.entries, function(_i, entry){
    $('#picker').append("<input name='pkmn' type='radio' value='"+_i+"'><img src='"+entry.sprites.down[0]+"' /></input>");
  });
  $('#picker').find('input').first().click();
}
Pokedex.prototype.sprite_list = function() {
  var sprites = {};
  // each entry
  $.each(this.entries, function(number, entry) {
    // each direction
    if (entry.sprites) {
      $.each(entry.sprites, function(direction, frames) {
        // each frame
        $.each(frames, function(frame, data){
          sprites[number+"-"+direction+"-"+frame] = data;
        });
      });
    }
  });
  return sprites;
}

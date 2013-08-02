(function($){
  function bind_keys(pokemon) {
    var self = pokemon;
    $(document).on("keydown", function(e){
      switch(e.keyCode) {
        case 38: // up
          self.moveUp();
          break;
        case 40: // down
          self.moveDown();
          break;
        case 37: // left
          self.moveLeft();
          break;
        case 39: // right
          self.moveRight();
          break;
        case 13: // enter
        case 32: // space
          message = prompt("say?", "hi")
          world.talk(message)
          break;
        default:
          break;
      }
    });
  }

  function connected_callback(pokemon) {
    renderer.load_sprites(world.pokedex.sprite_list());
    renderer.load_sprites({"bg": "/tile.gif"})
    var me = window.me = pokemon;
    $('#my_name').focus();
  }

  function do_connect() {
    window.username = $('#my_name').val()
    window.pokemons = $('#picker').find('input:checked').first().val();
    me.number = window.pokemons;
    me.name   = window.username;
    bind_keys(me);
    world.network.join(window.username, me);
    $('#welcome').fadeOut(); $('#surface').fadeIn();
    return false;
  }

  jQuery(function ($) {
    var server = document.location.hostname+':4567';
    var world = window.world = new Overworld(server, connected_callback);
    var renderer = window.renderer = new Renderer(world, $('#surface').get(0).getContext('2d'));
    window.do_connect = do_connect;
  });
})(jQuery);

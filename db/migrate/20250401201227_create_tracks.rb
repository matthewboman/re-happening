class CreateTracks < ActiveRecord::Migration[7.2]
  def change
    create_table :tracks do |t|
      t.text :title
      t.text :name
      t.text :email
      t.text :url
      t.boolean :is_playing
      t.integer :position
      t.float :start
      t.float :stop
      t.json :envelope

      t.timestamps
    end
  end
end

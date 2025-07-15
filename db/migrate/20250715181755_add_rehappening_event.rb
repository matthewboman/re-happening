class AddRehappeningEvent < ActiveRecord::Migration[7.2]
  def change
    Track.update_all(event_name: "rehappening")
  end
end

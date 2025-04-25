Rails.application.routes.draw do
  get "home/index"
  get "up" => "rails/health#show", as: :rails_health_check

  # SPA
  root "home#index"
  get "*path", to: "home#index", constraints: ->(req) do
    !req.xhr? && req.format.html?
  end

  # API
  get  "/api/get-all-tracks",     to: "api#get_all_tracks"
  post "/api/create-track",       to: "api#create_track"
  post "/api/get-new-tracks",     to: "api#get_new_tracks"
  post "/api/update-track/:id",   to: "api#update_track"
  post "/api/update-track-data",  to: "api#update_track_data"
  post "/api/update-track-order", to: "api#update_track_order"
end

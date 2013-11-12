!#/usr/bin/env ruby

###
# This file is part of memeizle.
# 
# memeizle is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# memeizle is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with memeizle.  If not, see <http://www.gnu.org/licenses/>.
####

#get your boobs
memes = [
]

i = 56
memes.each do |meme|
  `wget -O #{i}.gif #{meme}`
  i = i + 1
end